# Plan: Cart CRUD Backend

**ID**: 20260615-001
**Status**: ready
**Created**: 2026-06-15
**Author**: @architect

---

## TL;DR

Create `cart_items` table, CartItem model, CartController with REST API, and protected routes for authenticated user cart. Backend only, no frontend.

---

## Context

### Background

Project SiberMerch perlu fitur cart. User decision:
- **Scope**: Cart CRUD backend only
- **Auth**: Login only via Sanctum
- **PK**: Auto-increment (match existing tables)

### Current State

- Existing tables: auto-increment `$table->id()`
- FK pattern: `foreignId()->constrained()->onDelete('cascade')`
- Sanctum auth configured
- API format: `{ success: bool, data: ..., message: ... }`

### Target State

- `cart_items` table with FKs + unique constraint
- REST API: GET/POST/PUT/DELETE `/api/cart`
- Protected under `auth:sanctum`

---

## Objectives

### Primary Goals

1. Create `cart_items` migration
2. Create `CartItem` model with relations
3. Create `CartController` with CRUD
4. Register routes in `api.php`

### Success Criteria

- [ ] Migration runs without error
- [ ] CartItem model has fillable, casts, relations
- [ ] All CRUD endpoints work, consistent JSON response
- [ ] Quantity auto-increments on duplicate (user_id + product_id + variant_id)
- [ ] Unauthenticated requests return 401

### Non-Goals

- No frontend
- No guest cart
- No checkout/payment
- No promo integration
- No stock validation (done at checkout)

---

## DB Schema

```php
Schema::create('cart_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
    $table->integer('quantity')->default(1);
    $table->timestamps();

    $table->unique(['user_id', 'product_id', 'variant_id']);
});
```

---

## Execution Waves

### Wave 1: Backend (Sequential)

| Task ID | Description | Agent | Dependencies | Est. Time |
|---------|-------------|-------|--------------|-----------|
| 1.1 | Create cart_items migration | @build | none | 10m |
| 1.2 | Create CartItem model | @build | 1.1 | 10m |
| 1.3 | Create CartController | @build | 1.2 | 20m |
| 1.4 | Register cart routes | @build | 1.3 | 10m |

### Dependency Matrix

```
Wave 1: [1.1] → [1.2] → [1.3] → [1.4]
```

### File Conflict Check

| Task | Files to Modify |
|------|-----------------|
| 1.1 | `database/migrations/2026_06_15_000001_create_cart_items_table.php` (new) |
| 1.2 | `app/Models/CartItem.php` (new) |
| 1.3 | `app/Http/Controllers/API/CartController.php` (new) |
| 1.4 | `routes/api.php` (edit) |

**No overlap** — each file touched by exactly one task.

---

## Batching

All 4 tasks share same agent (@build) and code area. Batch into one subagent session.

```
Dispatch: batched:cart-backend
```

---

## Task Details

### TODO 1.1: Create cart_items migration

**Agent**: @build
**Dispatch**: batched:cart-backend
**Estimated Time**: 10m
**Dependencies**: none

#### Objective
Generate migration for `cart_items` table with schema above.

#### Acceptance Criteria
- [ ] Table `cart_items` created with all columns
- [ ] FK: user_id → users, product_id → products, variant_id → product_variants (nullable)
- [ ] Unique composite index on (user_id, product_id, variant_id)
- [ ] `down()` drops table

#### Implementation Notes
- Use `$table->id()` (auto-increment)
- Use `foreignId()->constrained()->onDelete('cascade')`
- `variant_id` nullable
- `timestamps()` — `created_at` = waktu ditambahkan
- Filename: `2026_06_15_000001_create_cart_items_table.php`

#### QA Scenarios

| Scenario | Input | Expected Output | Verification |
|----------|-------|-----------------|--------------|
| Run migration | `php artisan migrate` | Table created | Check DB structure |
| Rollback | `php artisan migrate:rollback` | Table dropped | Verify gone |
| Duplicate insert | Same user+product+variant twice | Constraint error | SQL test |

#### Files to Modify
- `database/migrations/2026_06_15_000001_create_cart_items_table.php` (new)

---

### TODO 1.2: Create CartItem model

**Agent**: @build
**Dispatch**: batched:cart-backend
**Estimated Time**: 10m
**Dependencies**: 1.1

#### Objective
Create CartItem Eloquent model.

#### Acceptance Criteria
- [ ] `$fillable`: user_id, product_id, variant_id, quantity
- [ ] `$casts`: quantity → integer
- [ ] Relations: user(), product(), variant()
- [ ] Uses `HasFactory` trait

#### Implementation Notes

```php
class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'variant_id', 'quantity'];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
```

#### QA Scenarios

| Scenario | Input | Expected | Verification |
|----------|-------|----------|-------------|
| Create | CartItem::create([...]) | Row created | tinker |
| user() | $item->user | User model | tinker |
| product() | $item->product | Product model | tinker |
| variant() | $item->variant | ProductVariant or null | tinker |

#### Files to Modify
- `app/Models/CartItem.php` (new)

---

### TODO 1.3: Create CartController

**Agent**: @build
**Dispatch**: batched:cart-backend
**Estimated Time**: 20m
**Dependencies**: 1.2

#### Objective
Create CartController with CRUD for authenticated user's cart.

#### Acceptance Criteria
- [ ] `index()` — list user's cart with product+variant eager loaded
- [ ] `store()` — add item, increment qty if duplicate (same user+product+variant)
- [ ] `update()` — update qty, verify ownership via `where('user_id', auth()->id())->findOrFail($id)`
- [ ] `destroy()` — remove single item, verify ownership same pattern
- [ ] `clear()` — delete all user's cart items
- [ ] Response format: `{ success: bool, data: ..., message: ... }`
- [ ] Store returns 201, others return 200

#### Implementation Notes

**Store logic (single approach):**
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|integer|exists:products,id',
        'variant_id' => 'nullable|integer|exists:product_variants,id',
        'quantity'   => 'required|integer|min:1|max:9999',
    ]);

    $item = CartItem::firstOrNew([
        'user_id'    => $request->user()->id,
        'product_id' => $validated['product_id'],
        'variant_id' => $validated['variant_id'] ?? null,
    ]);

    $item->quantity += $validated['quantity'];
    $item->save();

    $item->load(['product', 'variant']);

    return response()->json([
        'success' => true,
        'data'    => $item,
        'message' => 'Item ditambahkan ke keranjang.',
    ], 201);
}
```

**Update logic:**
```php
public function update(Request $request, string $id)
{
    $validated = $request->validate([
        'quantity' => 'required|integer|min:1|max:9999',
    ]);

    $item = CartItem::where('user_id', $request->user()->id)
        ->findOrFail($id);

    $item->update(['quantity' => $validated['quantity']]);
    $item->load(['product', 'variant']);

    return response()->json([
        'success' => true,
        'data'    => $item,
        'message' => 'Kuantitas diperbarui.',
    ]);
}
```

**Destroy:**
```php
public function destroy(string $id)
{
    $item = CartItem::where('user_id', auth()->id())
        ->findOrFail($id);

    $item->delete();

    return response()->json([
        'success' => true,
        'message' => 'Item dihapus dari keranjang.',
    ]);
}
```

**Clear:**
```php
public function clear(Request $request)
{
    $request->user()->cartItems()->delete();

    return response()->json([
        'success' => true,
        'message' => 'Keranjang dikosongkan.',
    ]);
}
```

**Index:**
```php
public function index(Request $request)
{
    $items = CartItem::where('user_id', $request->user()->id)
        ->with(['product', 'variant'])
        ->latest()
        ->get();

    return response()->json([
        'success' => true,
        'data'    => $items,
    ]);
}
```

Add `cartItems()` relation to User model (optional but recommended):
```php
public function cartItems()
{
    return $this->hasMany(CartItem::class);
}
```

#### API Contract

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | Sanctum | List cart items |
| POST | `/api/cart` | Sanctum | Add item (upsert + increment qty) |
| PUT | `/api/cart/{id}` | Sanctum | Update qty |
| DELETE | `/api/cart/{id}` | Sanctum | Remove single item |
| DELETE | `/api/cart` | Sanctum | Clear all items |

#### QA Scenarios

| Scenario | Input | Expected | Verification |
|----------|-------|----------|-------------|
| List empty cart | GET /api/cart | `{ success: true, data: [] }` | Postman |
| Add item | POST /api/cart `{ product_id:1, quantity:2 }` | 201, item created | Postman |
| Add same item again | POST /api/cart `{ product_id:1, quantity:1 }` | 201, qty=3 now | Postman |
| Add with variant | POST /api/cart `{ product_id:1, variant_id:5, quantity:1 }` | 201 | Postman |
| Update qty | PUT /api/cart/1 `{ quantity:5 }` | 200, qty=5 | Postman |
| Remove item | DELETE /api/cart/1 | 200, item gone | Postman |
| Clear cart | DELETE /api/cart | 200, all gone | Postman |
| No auth | GET /api/cart | 401 | Postman |
| Wrong owner | User B deletes User A's item | 404 | Postman |

#### Files to Modify
- `app/Http/Controllers/API/CartController.php` (new)
- `app/Models/User.php` (add cartItems() relation)

---

### TODO 1.4: Register cart routes

**Agent**: @build
**Dispatch**: batched:cart-backend
**Estimated Time**: 10m
**Dependencies**: 1.3

#### Objective
Add routes to `routes/api.php` inside `auth:sanctum` middleware group.

#### Acceptance Criteria
- [ ] All routes under `auth:sanctum`
- [ ] Delete clear route before delete destroy route
- [ ] Use CartController

#### Implementation Notes

Add inside existing `middleware('auth:sanctum')` group, after CS routes:

```php
use App\Http\Controllers\API\CartController;

// inside auth:sanctum group:
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::delete('/cart', [CartController::class, 'clear']); // BEFORE {id}
Route::put('/cart/{id}', [CartController::class, 'update']);
Route::delete('/cart/{id}', [CartController::class, 'destroy']);
```

Route `/cart` NOT prefixed — clean URL: `/api/cart`

#### QA Scenarios

| Scenario | Expected | Verification |
|----------|----------|-------------|
| `php artisan route:list` | Cart routes under auth:sanctum | CLI |
| DELETE /api/cart hits clear() | Returns `Keranjang dikosongkan` | Postman |

#### Files to Modify
- `routes/api.php` (edit — add cart routes)

---

## Verification Protocol

### Automated Checks
- [ ] `php artisan migrate` passes
- [ ] `php artisan migrate:rollback && php artisan migrate` clean
- [ ] `php artisan route:list` shows cart routes
- [ ] `php artisan test` — existing tests unaffected

### Manual Review
- [ ] Ownership checks on update/destroy
- [ ] Response format matches existing API
- [ ] firstOrNew + save handles upsert correctly
- [ ] No SQL injection

### Integration Testing
- [ ] Full flow: login → add → list → update → delete → clear
- [ ] Duplicate add increments qty
- [ ] variant_id null vs set works
- [ ] 401 on no auth

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Race condition upsert | Low | Medium | firstOrNew + save atomic enough for MVP; unique constraint prevents duplicates |
| variant_id orphan | Low | Medium | `exists:product_variants,id` validation |
| Orphaned cart on user delete | Low | High | `onDelete('cascade')` |
| Quantity overflow | Low | Low | `max:9999` validation |

---

## Assumptions

- Existing DB uses auto-increment PKs — confirmed
- Sanctum auth — confirmed via config
- Response format `{ success, data, message }` — confirmed from existing controllers
- Product variants optional — `variant_id` nullable

---

## Open Questions

None — all answered during interview phase.

---

## Appendix

### Related Documents

- Existing migration pattern: `database/migrations/2026_05_29_013333_create_products_table.php`
- Existing controller pattern: `app/Http/Controllers/API/CategoryController.php`
- Routes file: `routes/api.php`
- User model: `app/Models/User.php`
