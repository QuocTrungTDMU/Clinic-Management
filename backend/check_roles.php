<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ROLES TABLE ===\n";
try {
    $roles = DB::table('roles')->get();
    foreach ($roles as $role) {
        echo "ID: {$role->id}, Name: {$role->name}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== USERS WITH ROLES ===\n";
try {
    $users = DB::table('users')
        ->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
        ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
        ->select('users.name', 'users.email', 'roles.name as role_name')
        ->get();

    foreach ($users as $user) {
        echo "User: {$user->name} ({$user->email}) - Role: " . ($user->role_name ?? 'No role') . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
