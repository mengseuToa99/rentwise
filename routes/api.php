<?php

use App\Http\Controllers\AccessPermissionController;
use App\Http\Controllers\PermissionGroupController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
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
        Route::get('/landlords/properties/{property_id}', [PropertyController::class, 'getPropertyById']);

        // unit management routes
        Route::delete('/properties/{property}/delete-room', [PropertyController::class, 'deleteUnit']);

        //calculate unit
        Route::get('/{roomId}/utility-usage', [UnitController::class, 'getUtilityUsageByRoom']);
        Route::get('/properties/get-due-unit', [UnitController::class, 'getDueRooms']);
        Route::post('/properties/unit/calculation', [UnitController::class, 'calculateUtilityUsage']);
        Route::put('/unit-update', [UnitController::class, 'updateUtilityUsage']);

        // Permission Group Controller
        Route::get('/permission-groups', [PermissionGroupController::class, 'index']);
        Route::post('/permission-groups', [PermissionGroupController::class, 'store']);
        Route::put('/permission-groups/{id}', [PermissionGroupController::class, 'update']);
        Route::delete('/permission-groups/{id}', [PermissionGroupController::class, 'destroy']);

        // Role Controller
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

        // Permission Group Controller
        Route::get('/permissions', [AccessPermissionController::class, 'index']);
        Route::post('/permissions', [AccessPermissionController::class, 'store']);
        Route::put('/permissions/{id}', [AccessPermissionController::class, 'update']);
        Route::delete('/permissions/{id}', [AccessPermissionController::class, 'destroy']);


        // Rentail controller
        Route::post('/rentail', [RentalController::class, 'store']);

        

        

    //     Route::get('/properties', 'PropertyController@index')
    // ->middleware('permission:view_property');

    // Route::get('/system/settings', 'SystemController@settings')
    // ->middleware('permission:manage_system_settings');

    
    });
}); 