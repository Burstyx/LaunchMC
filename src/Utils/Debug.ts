export function error(msg: string | unknown) {
    console.log(`%c[ERROR] %c${msg}`, `font-weight: bold; color: red`, `color: red`)
}

export function info(msg: string | unknown) {
    console.log(`%c[INFO] %c${msg}`, `font-weight: bold; color: white`, `color: grey`)
}

export function warning(msg: string | unknown) {
    console.log(`%c[WARN] %c${msg}`, `font-weight: bold; color: orange`, `color: orange`)
}