<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Group all routes under the 'api/rentwise' prefix
Route::group(['prefix' => '/rentwise'], function () {

    Route::post('/login', [AuthController::class, 'login']); // POST method for login

    Route::group(['middleware' => 'auth:sanctum'], function () {
        // Profile route
        Route::get('/profile', [AuthController::class, 'profile']); // GET method for profile
        Route::put('/profile-edit/{id}', [AuthController::class, 'updateProfileById']);

        // User management routes
        Route::post('/create-user', [UserController::class, 'store']); 

        // Property management routes
        Route::delete('/properties/{property}', [PropertyController::class, 'deleteProperty']);
        Route::post('/properties-create', [PropertyController::class, 'store']); 
        Route::put('/properties/{property}', [PropertyController::class, 'updateProperty']);
        Route::get('/landlords/properties', [PropertyController::class, 'getPropertiesByLandlord']);
        // unit management routes
        Route::delete('/properties/{property}/delete-room', [PropertyController::class, 'deleteUnit']);

        //calculate unit
        Route::get('/properties/unit/calculation', [UnitController::class, 'getDueRooms']);
    });
}); 