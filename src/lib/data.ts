
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
        name: 'Car',
        image: '/icons/cars/car.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 2,
        name: 'Car',
        image: '/icons/cars/car.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 3,
        name: 'Car',
        image: '/icons/cars/car.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 4,
        name: 'Car',
        image: '/icons/cars/car.png',
        speed: 10,
        maxSpeed: 100,
        acceleration: 10,
        deceleration: 10,
        mass: 10
    },
    {
        id: 5,
        name: 'Car',
        image: '/icons/cars/car.png',
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
