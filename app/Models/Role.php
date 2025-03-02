<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    /** @use HasFactory<\Database\Factories\RoleFactory> */
    use HasFactory;

        /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'role_id'; 
    
    //fillable attributes
    protected $fillable = [];

    //get the modules of the role
    public function modules()
    {
        return $this->belongsToMany(Module::class,'role_modules','role_id','module_id')
            ->withPivot(['can_view', 'can_edit', 'can_delete', 'can_create']);
         
    }

    // get the user who have this role
    public function users(): HasMany
    {
        return $this->hasMany(UserRegistration::class, 'role_id', 'role_id');
    }
}
