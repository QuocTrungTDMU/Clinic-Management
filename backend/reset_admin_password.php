<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@clinic.local')->first();

if ($user) {
    $user->password = Hash::make('admin123');
    $user->save();
    echo "Password updated successfully for: " . $user->email . "\n";
    echo "New password: admin123\n";
} else {
    echo "User not found!\n";
}
