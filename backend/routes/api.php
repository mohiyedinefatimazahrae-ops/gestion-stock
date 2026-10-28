<?php

use App\Http\Controllers\AchatController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\UniteController;
use App\Http\Controllers\AchatDetailController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationStockController;
use App\Http\Controllers\RapportStockController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API fonctionne !',
        'success' => true
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index']);
Route::apiResource('categories', CategorieController::class);
Route::apiResource('unites', UniteController::class);
Route::apiResource('produits', ProduitController::class);
Route::apiResource('fournisseurs', FournisseurController::class);

Route::post(
    'achats/enregistrer-complet',
    [AchatController::class, 'enregistrerComplet']
);

Route::apiResource('achats', AchatController::class)
    ->except(['update']);

Route::put('achats/{id}', [AchatController::class, 'update']);
Route::patch('achats/{id}', [AchatController::class, 'update']);

Route::post('achats/{id}/valider', [
    AchatController::class,
    'validerAchat',
]);


Route::get(
    'achats/{achatId}/details',
    [AchatDetailController::class, 'index']
);

Route::post(
    'achats/{achatId}/details',
    [AchatDetailController::class, 'store']
);

Route::put(
    'achats/{achatId}/details/{detailId}',
    [AchatDetailController::class, 'update']
);

Route::delete(
    'achats/{achatId}/details/{detailId}',
    [AchatDetailController::class, 'destroy']
);


Route::apiResource('productions', ProductionController::class);

Route::get(
    'productions/{id}/matieres',
    [ProductionController::class, 'matieres']
);

Route::post(
    'productions/{id}/matieres',
    [ProductionController::class, 'ajouterMatiere']
);

Route::put(
    'productions/{id}/matieres/{matiereId}',
    [ProductionController::class, 'modifierMatiere']
);

Route::delete(
    'productions/{id}/matieres/{matiereId}',
    [ProductionController::class, 'supprimerMatiere']
);

Route::post(
    'productions/{id}/demarrer',
    [ProductionController::class, 'demarrerProduction']
);

Route::post(
    'productions/{id}/terminer',
    [ProductionController::class, 'terminerProduction']
);

Route::post(
    'productions/{id}/livrer',
    [ProductionController::class, 'livrerProduction']
);



Route::get('/mouvements-stock', [
    MouvementStockController::class,
    'index',
]);

Route::post(
    '/mouvements-stock/ajustement',
    [MouvementStockController::class, 'ajusterStock']
);

Route::get('/mouvements-stock/{id}', [
    MouvementStockController::class,
    'show',
]);

Route::get('/notifications-stock', [
    NotificationStockController::class,
    'index',
]);

Route::patch('/notifications-stock/{id}/lue', [
    NotificationStockController::class,
    'marquerCommeLue',
]);

Route::patch('/notifications-stock/tout-lire', [
    NotificationStockController::class,
    'toutMarquerCommeLu',
]);

Route::get('/rapports/stock/pdf', [
    RapportStockController::class,
    'stock',
]);

Route::get('/rapports/produits-a-acheter/pdf', [
    RapportStockController::class,
    'produitsAAcheter',
]);

Route::get(
    'achats/{id}/facture/download',
    [AchatController::class, 'telechargerFacture']
);
