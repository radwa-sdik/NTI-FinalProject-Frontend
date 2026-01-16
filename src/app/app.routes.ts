import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { CategoryList } from './components/category-list/category-list';
import { ProductDetails } from './components/product-details/product-details';
import { ManageProduct } from './components/manage-product/manage-product';
import { ManageCategories } from './components/manage-categories/manage-categories';
import { UserCart } from './components/user-cart/user-cart';
import { CheckOut } from './components/check-out/check-out';
import { Addresses } from './components/addresses/addresses';
import { OrdersList } from './components/orders-list/orders-list';
import { ManageOrders } from './components/manage-orders/manage-orders';
import { Component } from '@angular/core';
import { Chat } from './components/chat/chat';
import { ChatList } from './components/chat-list/chat-list';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home',component:Home},
    {path:'auth/login',component:Login},
    {path:'auth/register', component:Register},
    {path:'products', component:Products},
    {path:'products/:id', component:ProductDetails},
    {path:'manage-products', component:ManageProduct},
    {path:'categories', component:CategoryList},
    {path:'manage-categories', component: ManageCategories},
    {path:'orders', component: OrdersList},
    {path:'manage-orders', component: ManageOrders},
    {path:'cart',component: UserCart},
    {path:'checkout', component: CheckOut},
    {path:'addresses', component: Addresses},
    {path:'chats', component: ChatList}
];
