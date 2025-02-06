<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Group all routes under the 'api/rentwise' prefix
Route::group(['prefix' => '/rentwise'], function () {

    Route::post('/login', [AuthController::class, 'login']); // POST method for login
    

    // Routes that require authentication
    Route::group(['middleware' => 'auth:sanctum'], function () {
        // Profile route
        Route::get('/profile', [AuthController::class, 'profile']); // GET method for profile
        Route::put('/profile-edit/{id}', [AuthController::class, 'updateProfileById']);

        // User management routes
        Route::post('/create-user', [UserController::class, 'store']); // POST method for creating a user
       

        // Property management routes
        Route::post('/properties-create', [PropertyController::class, 'store']); // POST method for creating a property
    });
}); 