// Armazenamento em memória: os dados vivem enquanto o processo estiver ativo.
const inicial = () => ({
  autores: [
    { id: '1', nome: 'José Saramago', nascimento: '1922-11-16' },
    { id: '2', nome: 'Fernando Pessoa', nascimento: '1888-06-13' },
    { id: '3', nome: 'Sophia de Mello Breyner', nascimento: '1919-11-06' },
  ],
  livros: [
    { id: '1', titulo: 'Ensaio sobre a Cegueira', ano: 1995, genero: 'FICCAO', autorId: '1' },
    { id: '2', titulo: 'Memorial do Convento', ano: 1982, genero: 'FICCAO', autorId: '1' },
    { id: '3', titulo: 'Mensagem', ano: 1934, genero: 'POESIA', autorId: '2' },
    { id: '4', titulo: 'Livro do Desassossego', ano: 1982, genero: 'NAO_FICCAO', autorId: '2' },
    { id: '5', titulo: 'Mar Novo', ano: 1958, genero: 'POESIA', autorId: '3' },
  ],
  criticas: [
    { id: '1', livroId: '1', nota: 5, comentario: 'Inesquecível.' },
    { id: '2', livroId: '1', nota: 4, comentario: 'Duro mas necessário.' },
    { id: '3', livroId: '3', nota: 5, comentario: null },
  ],
})

const contadoresIniciais = () => ({ autor: 3, livro: 5, critica: 3 })

export function criarStore() {
  const store = {
    ...inicial(),
    contadores: contadoresIniciais(),
    proximoId(tipo) {
      store.contadores[tipo] += 1
      return String(store.contadores[tipo])
    },
    reiniciar() {
      Object.assign(store, inicial(), { contadores: contadoresIniciais() })
    },
  }
  return store
}

// Utilizadores de estudo. Em produção, valida-se um JWT ou uma sessão.
export const utilizadores = {
  'tok-admin': { id: 'u1', nome: 'Ana Admin', papel: 'ADMIN' },
  'tok-leitor': { id: 'u2', nome: 'Rui Leitor', papel: 'LEITOR' },
}
