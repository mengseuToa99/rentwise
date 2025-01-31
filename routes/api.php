<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::prefix('rentwise')->group(function () {
    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // User management routes
    Route::post('/create-user', [UserController::class, 'store']);
    Route::get('/users/role/{role?}', [UserController::class, 'getUsersByRole']);

});