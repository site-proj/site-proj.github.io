(function matheusApp(){
 "use strict";
 const byId=id=>document.getElementById(id);
 const ids=["nome","cpf","nascimento","endereco","mensalidade","vencimento","horario","dataContrato"];
 const field=Object.fromEntries(ids.map(id=>[id,byId(id)]));
 const form=byId("contractForm"), alertBox=byId("alert"), submit=byId("downloadBtn");
 for(let d=1;d<=31;d++){let o=document.createElement("option");o.value=String(d);o.textContent=String(d);field.vencimento.appendChild(o);}
 field.vencimento.value="30";
 let today=new Date(),pad=n=>String(n).padStart(2,"0");
 field.dataContrato.value=today.getFullYear()+"-"+pad(today.getMonth()+1)+"-"+pad(today.getDate());
 const months=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
 const units=["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
 const tens=["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
 const hundreds=["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"];
 function cpfMask(v){let s=String(v).replace(/\D/g,"").slice(0,11);return s.replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,'.$1-$2');}
 function amount(v){let s=String(v||"").replace(/[^\d.,]/g,"");if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");else if((s.match(/\./g)||[]).length>1)s=s.replace(/\./g,"");return s?Number(s):NaN;}
 function under1000(n){if(n===100)return"cem";let parts=[];if(n>=100){parts.push(hundreds[Math.floor(n/100)]);n%=100;}if(n>=20){parts.push(tens[Math.floor(n/10)]);n%=10;}if(n)parts.push(units[n]);return parts.join(" e ");}
 function intWords(n){if(!n)return"zero";if(n<1000)return under1000(n);let a=Math.floor(n/1000),b=n%1000;return(a===1?"mil":under1000(a)+" mil")+(b?(b<100||b%100===0?" e ":", ")+under1000(b):"");}
 function inWords(n){let cents=Math.round(n*100),r=Math.floor(cents/100),c=cents%100;return(r?intWords(r)+(r===1?" real":" reais"):"")+(c?(r?" e ":"")+intWords(c)+(c===1?" centavo":" centavos"):"")||"zero real";}
 function brDate(value){let m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||"");return m?m[3]+"/"+m[2]+"/"+m[1]:"__/__/____";}
 function fullDate(value){let m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||"");return m?"Jundiaí, "+Number(m[3])+" de "+months[Number(m[2])-1]+" de "+m[1]+".":"Jundiaí, __ de __________ de ____.";}
 function data(){let n=amount(field.mensalidade.value),valid=Number.isFinite(n)&&n>0&&n<1000000;return{nome:field.nome.value.trim(),cpf:cpfMask(field.cpf.value),nascimento:brDate(field.nascimento.value),endereco:field.endereco.value.trim(),horario:field.horario.value.trim(),value:n,valor:valid?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n):"R$ ______",extenso:valid?inWords(n):"__________________",vencimento:field.vencimento.value||"__",data:fullDate(field.dataContrato.value)};}
 function preview(){let d=data();for(let [id,v] of Object.entries({pNome:d.nome||"Nome completo do aluno",pCpf:d.cpf||"________________",pNasc:d.nascimento,pEndereco:d.endereco||"________________________________",pHorario:d.horario||"____________________________",pValor:d.valor,pExtenso:"("+d.extenso+")",pVenc:d.vencimento,pData:d.data})){let node=byId(id);if(node)node.textContent=v;}}
 function warning(msg){alertBox.textContent=msg;alertBox.classList.toggle("show",!!msg);}
 function valid(){for(let [id,label] of [["nome","nome completo"],["cpf","CPF"],["mensalidade","mensalidade"],["vencimento","dia do vencimento"],["dataContrato","data da assinatura"]]){if(!field[id].value.trim()){warning("Preencha "+label+".");field[id].focus();return false;}}if(field.cpf.value.replace(/\D/g,"").length!==11){warning("Digite os 11 números do CPF.");field.cpf.focus();return false;}let n=amount(field.mensalidade.value);if(!Number.isFinite(n)||n<=0||n>=1000000){warning("Informe uma mensalidade válida.");field.mensalidade.focus();return false;}if(!/^\d{4}-\d{2}-\d{2}$/.test(field.dataContrato.value)){warning("Selecione a data no calendário.");return false;}warning("");return true;}
 field.cpf.addEventListener("input",()=>{field.cpf.value=cpfMask(field.cpf.value);preview();});
 for(let id of ids){field[id].addEventListener("input",preview);field[id].addEventListener("change",preview);}
 field.mensalidade.addEventListener("blur",()=>{let n=amount(field.mensalidade.value);if(Number.isFinite(n)&&n>0)field.mensalidade.value=n.toFixed(2).replace(".",",");preview();});
 function pdf(d){
  const W=595.28,H=841.89,L=49,R=546,ink=[.17,.16,.15],dim=[.43,.40,.38],copper=[.62,.35,.18],ops=[];let y=45;
  const col=a=>a.map(x=>x.toFixed(3)).join(" ");
  const escaped=s=>String(s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,"-").replace(/[^\x20-\x7E\xA0-\xFF]/g,"?").replace(/([\\()])/g,"\\$1");
  const text=(s,x,top,size=10,bold=false,color=ink)=>ops.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf "+col(color)+" rg 1 0 0 1 "+x.toFixed(2)+" "+(H-top).toFixed(2)+" Tm ("+escaped(s)+") Tj ET");
  const line=(x1,t1,x2,t2,color=[.82,.81,.8],width=.7)=>ops.push(col(color)+" RG "+width+" w "+x1.toFixed(2)+" "+(H-t1).toFixed(2)+" m "+x2.toFixed(2)+" "+(H-t2).toFixed(2)+" l S");
  const widthOf=(s,size,bold)=>{const ctx=pdf.ctx||(pdf.ctx=document.createElement("canvas").getContext("2d"));ctx.font=(bold?"bold ":"")+size+"px Arial";return ctx.measureText(String(s)).width;};
  const wrap=(val,size=10,max=R-L,bold=false)=>{let rows=[],current="";for(let word of String(val||"").split(/\s+/).filter(Boolean)){let candidate=current?current+" "+word:word;if(widthOf(candidate,size,bold)<=max){current=candidate;continue;}if(current){rows.push(current);current="";}if(widthOf(word,size,bold)<=max){current=word;continue;}let chunk="";for(let ch of word){if(widthOf(chunk+ch,size,bold)>max&&chunk){rows.push(chunk);chunk="";}chunk+=ch;}current=chunk;}if(current)rows.push(current);return rows.length?rows:[""];};
  const paragraph=(s,size=9.7,bold=false,color=ink,space=13.2)=>{for(let row of wrap(s,size,R-L,bold)){text(row,L,y,size,bold,color);y+=space;}};
  const heading=(s,after=13)=>{text(s.toUpperCase(),L,y,9,true,copper);y+=after;};
  text("MATHEUS",L,y,12.4,true);text("WKEY",L+65,y,12.4,true,copper);text("DOCUMENTOS / CONTRATOS",R-151,y,7.3,false,dim);y+=32;
  text("CONTRATO SIMPLES DE AULAS DE TECLADO",L,y,14.5,true);y+=12;line(L,y,R,y,copper,1.5);y+=27;
  heading("PROFESSOR (CONTRATADO)");paragraph("Matheus Henrique de Azevedo",10.3,true);paragraph("CPF: 091.878.681-99 | Nascimento: 23/01/2008",9.8);paragraph("E-mail: Matheushenrique171093@gmail.com",9.8);y+=14;
  heading("ALUNO(A) (CONTRATANTE)");paragraph(d.nome,10.3,true);paragraph("CPF: "+d.cpf+" | Nascimento: "+d.nascimento,9.8);paragraph("Endereço: "+(d.endereco||"________________________________"),9.8);y+=22;line(L,y-9,R,y-9,[.88,.86,.83],.65);
  const clause=(title,rows)=>{heading(title,14);for(let row of rows)paragraph(row);y+=15;};
  clause("CLÁUSULA 1 - DAS AULAS",["1.1 - 01 aula por semana, com duração de 01 hora.","1.2 - Dia e horário fixo: "+(d.horario||"________________________________")]);
  clause("CLÁUSULA 2 - DO PAGAMENTO",["2.1 - Mensalidade: "+d.valor+" ("+d.extenso+").","2.2 - Pagamento antecipado, com vencimento todo dia "+d.vencimento+".","2.3 - Sem pagamento, não haverá aula.","2.4 - Não haverá reembolso após o início do mês."]);
  clause("CLÁUSULA 3 - DAS FALTAS",["3.1 - Aviso com 24h de antecedência dá direito à reposição no mesmo mês.","3.2 - Sem aviso, a aula será considerada dada.","3.3 - Falta do professor dá direito à reposição."]);
  clause("CLÁUSULA 4 - DO CANCELAMENTO",["4.1 - Aviso mínimo de 07 dias antes do vencimento."]);
  y+=12;if(y>704)throw Error("Os dados são extensos para uma página A4. Encurte o endereço ou horário.");text(d.data,L,y,10.1);let signY=Math.min(Math.max(y+72,742),783);line(L,signY,L+211,signY,ink,.75);line(R-211,signY,R,signY,ink,.75);text("Professor (contratado)",L+49,signY+13,8.7);text("Aluno(a) (contratante)",R-211+44,signY+13,8.7);line(L,808,R,808,[.87,.85,.82],.6);text("MATHEUS WKEY  /  AULAS DE TECLADO",L,820,7.6,false,dim);
  const stream=ops.join("\n")+"\n",objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W.toFixed(2)+" "+H.toFixed(2)+'] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>','<< /Length '+stream.length+' >>\nstream\n'+stream+"endstream"];
  let str="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n",offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(str.length);str+=(i+1)+" 0 obj\n"+objects[i]+"\nendobj\n";}let xref=str.length;str+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";for(let i=1;i<offsets.length;i++)str+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";str+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";
  return new Blob([Uint8Array.from(str,ch=>ch.charCodeAt(0))],{type:"application/pdf"});
 }
 form.addEventListener("submit",e=>{e.preventDefault();if(!valid())return;submit.disabled=true;try{let d=data(),blob=pdf(d),url=URL.createObjectURL(blob),a=document.createElement("a"),name=d.nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9 -]/g,"").trim().replace(/\s+/g,"_").slice(0,65);a.href=url;a.download="Contrato_Matheus_WKEY_"+(name||"Aluno")+".pdf";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(err){warning(err.message||"Não foi possível gerar o PDF.");}finally{submit.disabled=false;}});
 byId("printBtn").addEventListener("click",()=>{if(valid())window.print();});
 preview();
 window.__wkeyTest={pdf,data,preview};
})();