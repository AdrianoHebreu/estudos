# 06 Storage de ficheiros

## Buckets e objetos

O Supabase Storage guarda ficheiros organizados em **buckets**, que funcionam como pastas de topo. Os metadados ficam na base de dados, na tabela `storage.objects`, e por isso o acesso é controlado com as mesmas políticas RLS dos módulos anteriores.

## Buckets públicos e privados

| Tipo | Comportamento |
|---|---|
| Público | Qualquer pessoa com o URL lê o ficheiro; o upload continua a exigir política |
| Privado | Leitura e escrita exigem política ou um URL assinado |

Cria um bucket no dashboard (Storage → New bucket) ou por SQL:

    insert into storage.buckets (id, name, public)
    values ('avatares', 'avatares', false);

Podes limitar o tamanho máximo e os tipos de ficheiro aceites na configuração do bucket.

## Limites e tipos permitidos

Cada bucket pode restringir o que aceita:

    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'anexos', 'anexos', false,
      5242880,                                   -- 5 MB
      array['image/png', 'image/jpeg', 'application/pdf']
    );

Os limites do bucket são verificados pelo Storage. Existe ainda um limite global por projeto, definido nas definições de Storage, e que varia com o plano.

**ATENÇÃO:** validar o tipo no browser não chega. O utilizador pode contornar o código do cliente, por isso a restrição tem de estar no bucket ou numa política.

## Enviar e descarregar

    // upload
    const { data, error } = await supabase.storage
      .from('avatares')
      .upload(`${user.id}/perfil.png`, ficheiro, { upsert: true })

    // download
    const { data: blob } = await supabase.storage
      .from('avatares')
      .download(`${user.id}/perfil.png`)

    // listar e remover
    await supabase.storage.from('avatares').list(user.id)
    await supabase.storage.from('avatares').remove([`${user.id}/perfil.png`])

O caminho funciona como organização por pastas. Prefixar com o `user.id` torna fácil escrever políticas por dono.

## Ficheiros grandes e uploads diretos

Para ficheiros pequenos o `upload` normal serve. Para ficheiros grandes existem alternativas:

| Método | Quando usar |
|---|---|
| `upload` padrão | Ficheiros pequenos, até alguns MB |
| Upload retomável (protocolo TUS) | Ficheiros grandes ou ligações instáveis; retoma após falha |
| URL de upload assinado | O servidor autoriza e o cliente envia diretamente, sem política de `insert` |

    // no servidor, com sessão válida
    const { data } = await supabase.storage
      .from('anexos')
      .createSignedUploadUrl(`${user.id}/relatorio.pdf`)

    // no cliente, com o token devolvido
    await supabase.storage
      .from('anexos')
      .uploadToSignedUrl(data.path, data.token, ficheiro)

## Ligar ficheiros às tarefas

No projeto fio condutor, guarda o caminho do anexo numa tabela, não o URL:

    create table public.anexos (
      id bigint generated always as identity primary key,
      tarefa_id bigint not null references public.tarefas (id) on delete cascade,
      caminho text not null,
      criado_em timestamptz not null default now()
    );

    alter table public.anexos enable row level security;

O fluxo no código tem três passos:

1. Envia o ficheiro para `anexos/<user.id>/<nome>`.
2. Se o upload terminou sem erro, insere a linha em `anexos` com o caminho.
3. Para mostrar, gera um URL assinado a partir do caminho guardado.

Ao apagar, remove também o ficheiro: `supabase.storage.from('anexos').remove([caminho])`. Apagar a linha da base de dados não apaga o ficheiro.

**NOTA:** não apagues ficheiros diretamente com SQL em `storage.objects`; isso remove só o registo e deixa o ficheiro órfão. Usa sempre a API do Storage.

## Transformação de imagens

O Storage pode redimensionar imagens no momento da entrega. Segundo a documentação, a funcionalidade está disponível nos planos **Pro** e superiores:

    const { data } = supabase.storage.from('publico').getPublicUrl('foto.jpg', {
      transform: { width: 200, height: 200 },
    })

O modo de redimensionamento (`cover`, `contain` ou `fill`) também se pode indicar com `resize`; confirma na documentação em que métodos é aceite.

## URLs públicos e assinados

    // bucket público
    const { data } = supabase.storage.from('publico').getPublicUrl('logo.png')

    // bucket privado: URL temporário (60 segundos)
    const { data: url } = await supabase.storage
      .from('avatares')
      .createSignedUrl(`${user.id}/perfil.png`, 60)

Os URLs assinados expiram, o que permite partilhar um ficheiro privado durante um período limitado.

## Políticas de acesso

As políticas aplicam-se a `storage.objects`. Cada utilizador acede apenas à sua pasta:

    create policy "Ler a própria pasta"
    on storage.objects for select
    to authenticated
    using (
      bucket_id = 'avatares'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );

    create policy "Enviar para a própria pasta"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'avatares'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );

`storage.foldername(name)` devolve as pastas do caminho; o primeiro elemento é o `user.id`.

**ATENÇÃO:** sem política de `insert`, o upload falha com um erro de violação de RLS. Para `upsert`, precisas também das políticas de `select` e `update`.

**DICA:** guarda na tabela `perfis` apenas o caminho do ficheiro e gera o URL quando precisares. Assim mudas a política de acesso sem alterar dados.

**PRATICAR:** faz os exercícios 19 e 20 do módulo 11.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `new row violates row-level security policy` no upload | Falta política de `insert` em `storage.objects` |
| `The resource already exists` | Ficheiro existente; usa outro nome ou `upsert: true` |
| `Bucket not found` | Nome do bucket errado ou bucket não criado |
| O URL público dá erro | O bucket é privado; usa URL assinado |
| `Payload too large` | Excede o limite do bucket ou do projeto |
| Imagem aparece com o nome errado | Falta definir `contentType` no upload |

## Exercícios

1. Cria o bucket `anexos`, privado, limitado a 5 MB e a imagens e PDF.
2. Escreve as políticas para cada utilizador só aceder à sua pasta.
3. Cria a tabela `anexos`, envia um ficheiro e liga-o a uma tarefa.
4. Remove o anexo e confirma que o ficheiro e a linha desaparecem.

## Fontes oficiais

- [Visão geral do Storage](https://supabase.com/docs/guides/storage)
- [Controlo de acesso](https://supabase.com/docs/guides/storage/security/access-control)
- [Uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
