
export type Car = {
    id: number;
    name: string;
    image: string;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    mass: number;
}

export type City = {
    id: number;
    name: string;
    image: string;
}

export const cars: Car[] = [
    {
        id: 1,
        name: 'Ai',
        image: '/icons/cars/Ai.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 2,
        name: 'Daika',
        image: '/icons/cars/Daika.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 3,
        name: 'Daishi',
        image: '/icons/cars/Daishi.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 4,
        name: 'Himari',
        image: '/icons/cars/Himari.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 5,
        name: 'Ouki',
        image: '/icons/cars/Ouki.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 6,
        name: 'Renzo',
        image: '/icons/cars/Renzo.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 7,
        name: 'Sadako',
        image: '/icons/cars/Sadako.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
]

export const cities: City[] = [
    {
        id: 1,
        name: 'Japan',
        image: '/icons/cities/japan.png'
    },
]
