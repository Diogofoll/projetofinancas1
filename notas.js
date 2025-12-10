const KEY = "financas";
let editId = null;

function load(){
  const s = localStorage.getItem(KEY);
  return s ? JSON.parse(s) : { sal: 0, des: [] };
}

function save(obj){
  localStorage.setItem(KEY, JSON.stringify(obj));
}

function salvar(){
  const v = document.getElementById("sal").value;
  if (v === "" || isNaN(Number(v))){
    alert("Informe um salário válido.");
    return;
  }
  const o = load();
  o.sal = Number(v);
  save(o);
  render();
}

function formatDate(s){
  if (!s) return null;
  s = s.trim();
  // aceitar dd/mm/aaaa ou d/m/aaaa ou dd-mm-aaaa
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1){
    const d = m1[1].padStart(2,"0");
    const m = m1[2].padStart(2,"0");
    const y = m1[3];
    return `${y}-${m}-${d}`;
  }
  // aceitar yyyy-mm-dd
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2){
    const y = m2[1];
    const m = m2[2].padStart(2,"0");
    const d = m2[3].padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
  const t = new Date(s);
  if (isNaN(t.getTime())) return null;
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDisplayDate(ymd){
  if(!ymd) return "";
  const [y,m,d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function adicionar(){
  console.log("adicionar() chamada");
  const nome = (document.getElementById("nome").value || "").trim();
  const dataRaw = document.getElementById("data").value || "";
  const valorRaw = document.getElementById("valor").value;

  if (!nome){
    alert("Informe o nome da despesa.");
    return;
  }
  if (valorRaw === "" || isNaN(Number(valorRaw)) || Number(valorRaw) <= 0){
    alert("Informe um valor válido (> 0).");
    return;
  }
  const data = formatDate(dataRaw);
  if (!data){
    alert("Informe a data no formato dd/mm/aaaa ou yyyy-mm-dd.");
    return;
  }

  const o = load();
  if (editId){
    for (let i = 0; i < o.des.length; i++){
      if (o.des[i].id === editId){
        o.des[i].n = nome;
        o.des[i].d = data;
        o.des[i].v = Number(valorRaw);
        break;
      }
    }
    editId = null;
    document.getElementById("btnAdd").textContent = "Adicionar";
  } else {
    o.des.push({ id: String(Date.now()), n: nome, d: data, v: Number(valorRaw) });
  }

  save(o);
  document.getElementById("nome").value = "";
  document.getElementById("data").value = "";
  document.getElementById("valor").value = "";
  render();
}

function editarItem(id){
  const o = load();
  const it = o.des.find(x => x.id === id);
  if (!it) return;
  document.getElementById("nome").value = it.n;
  document.getElementById("data").value = toDisplayDate(it.d);
  document.getElementById("valor").value = it.v;
  editId = id;
  document.getElementById("btnAdd").textContent = "Salvar";
}

function remover(id){
  const o = load();
  o.des = o.des.filter(x => x.id !== id);
  save(o);
  render();
}

function limpar(){
  localStorage.removeItem(KEY);
  editId = null;
  document.getElementById("btnAdd").textContent = "Adicionar";
  document.getElementById("sal").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("data").value = "";
  document.getElementById("valor").value = "";
  render();
}

function resumo(){
  const o = load();
  const total = o.des.reduce((s, x) => s + Number(x.v || 0), 0);
  const sal = Number(o.sal || 0);
  const saldo = sal - total;
  alert(
    "Salário: R$ " + sal.toLocaleString("pt-BR",{minimumFractionDigits:2}) +
    "\nTotal: R$ " + total.toLocaleString("pt-BR",{minimumFractionDigits:2}) +
    "\nSaldo: R$ " + saldo.toLocaleString("pt-BR",{minimumFractionDigits:2})
  );
}

function render(){
  const o = load();
  const lista = document.getElementById("lista");
  if (lista) lista.innerHTML = "";

  o.des.slice().sort((a,b)=> a.d < b.d ? 1 : -1).forEach(it => {
    const li = document.createElement("li");
    li.className = "item";
    li.textContent = `${it.n} — ${toDisplayDate(it.d)} — R$ ${Number(it.v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;

    const be = document.createElement("button"); be.textContent = "Editar"; be.onclick = ()=>editarItem(it.id);
    const bx = document.createElement("button"); bx.textContent = "Remover"; bx.onclick = ()=>remover(it.id);
    li.appendChild(be); li.appendChild(bx);

    if (lista) lista.appendChild(li);
  });

  const total = o.des.reduce((s,x)=>s + Number(x.v||0), 0);
  const sal = Number(o.sal||0);
  const saldo = sal - total;
  const sd = document.getElementById("salDisplay");
  const td = document.getElementById("totalDisplay");
  const sod = document.getElementById("saldoDisplay");
  if (sd) sd.textContent = "R$ " + sal.toLocaleString("pt-BR",{minimumFractionDigits:2});
  if (td) td.textContent = "R$ " + total.toLocaleString("pt-BR",{minimumFractionDigits:2});
  if (sod) sod.textContent = "R$ " + saldo.toLocaleString("pt-BR",{minimumFractionDigits:2});

  if (document.getElementById("sal")) document.getElementById("sal").value = o.sal || "";
}

window.onload = render;