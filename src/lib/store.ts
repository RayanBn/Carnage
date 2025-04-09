import { createStore } from 'zustand';

export type Car = {
    id: number;
    name: string;
    image: string;
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
        image: '/icons/cars/car.png'
    },
    {
        id: 2,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 3,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 4,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 5,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
]

export const cities: City[] = [
    {
        id: 1,
        name: 'Japan',
        image: '/icons/cities/japan.png'
    },
]
