const produtos: string[] = ["Romance Policial", "Caneca de Cerâmica"];
document.querySelector("#lista")!.innerHTML = produtos.map((p) => `<li>${p}</li>`).join("");
