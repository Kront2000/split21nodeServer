export function randomaizer(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function randomId(){
    return Math.floor((Math.random() * 10**8))
}
