export function quemSou() {
    return {
        file: import.meta.file,
        main: import.meta.main,
        eAEntrada: import.meta.path === Bun.main,
    };
}
