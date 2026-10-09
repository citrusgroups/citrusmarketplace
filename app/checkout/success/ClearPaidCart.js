"use client";
import {useEffect} from "react";
import {useCartStore} from "@/store/cartStore";
export default function ClearPaidCart(){useEffect(()=>{useCartStore.getState().clearCart();useCartStore.getState().clearCoupon();},[]);return null;}
