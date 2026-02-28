<?php

use App\Models\Mascota;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use App\Policies\MascotaPolicy;
use App\Policies\PostPolicy;
use App\Policies\ProductPolicy;

test('post policy rules are enforced', function () {
    $policy = new PostPolicy();

    $activePost = new Post(['is_active' => true, 'user_id' => 10]);
    $inactivePost = new Post(['is_active' => false, 'user_id' => 10]);

    expect($policy->viewAny(null))->toBeTrue();
    expect($policy->view(null, $activePost))->toBeTrue();
    expect($policy->view(null, $inactivePost))->toBeFalse();

    $author = new User();
    $author->id = 10;
    $author->role = 'cliente';

    $otherUser = new User();
    $otherUser->id = 11;
    $otherUser->role = 'cliente';

    $admin = new User();
    $admin->id = 12;
    $admin->role = 'admin';

    expect($policy->create($author))->toBeTrue();
    expect($policy->like($author, $activePost))->toBeTrue();

    expect($policy->update($author, $activePost))->toBeTrue();
    expect($policy->update($otherUser, $activePost))->toBeFalse();

    expect($policy->delete($author, $activePost))->toBeTrue();
    expect($policy->delete($otherUser, $activePost))->toBeFalse();
    expect($policy->delete($admin, $activePost))->toBeTrue();

    expect($policy->restore($admin, $activePost))->toBeTrue();
    expect($policy->restore($author, $activePost))->toBeFalse();

    expect($policy->forceDelete($admin, $activePost))->toBeTrue();
    expect($policy->forceDelete($author, $activePost))->toBeFalse();
});

test('product policy rules are enforced', function () {
    $policy = new ProductPolicy();

    $product = new Product(['user_id' => 20]);

    $admin = new User();
    $admin->id = 1;
    $admin->role = 'admin';

    $aliadoOwner = new User();
    $aliadoOwner->id = 20;
    $aliadoOwner->role = 'aliado';

    $aliadoOther = new User();
    $aliadoOther->id = 21;
    $aliadoOther->role = 'aliado';

    $cliente = new User();
    $cliente->id = 30;
    $cliente->role = 'cliente';

    expect($policy->viewAny($admin))->toBeFalse();

    expect($policy->create($admin))->toBeTrue();
    expect($policy->create($aliadoOwner))->toBeTrue();
    expect($policy->create($cliente))->toBeFalse();

    expect($policy->view($admin, $product))->toBeTrue();
    expect($policy->view($aliadoOwner, $product))->toBeTrue();
    expect($policy->view($aliadoOther, $product))->toBeFalse();

    expect($policy->update($admin, $product))->toBeTrue();
    expect($policy->update($aliadoOwner, $product))->toBeTrue();
    expect($policy->update($aliadoOther, $product))->toBeFalse();

    expect($policy->delete($admin, $product))->toBeTrue();
    expect($policy->delete($aliadoOwner, $product))->toBeTrue();
    expect($policy->delete($aliadoOther, $product))->toBeFalse();
});

test('mascota policy rules are enforced', function () {
    $policy = new MascotaPolicy();

    $mascota = new Mascota(['user_id' => 40]);

    $admin = new User();
    $admin->id = 1;
    $admin->role = 'admin';

    $owner = new User();
    $owner->id = 40;
    $owner->role = 'aliado';

    $other = new User();
    $other->id = 41;
    $other->role = 'aliado';

    expect($policy->view($admin, $mascota))->toBeTrue();
    expect($policy->view($owner, $mascota))->toBeTrue();
    expect($policy->view($other, $mascota))->toBeFalse();

    expect($policy->update($admin, $mascota))->toBeTrue();
    expect($policy->update($owner, $mascota))->toBeTrue();
    expect($policy->update($other, $mascota))->toBeFalse();

    expect($policy->delete($admin, $mascota))->toBeTrue();
    expect($policy->delete($owner, $mascota))->toBeTrue();
    expect($policy->delete($other, $mascota))->toBeFalse();
});
