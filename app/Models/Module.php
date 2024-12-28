<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    /** @use HasFactory<\Database\Factories\ModuleFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'module_id'; 
    
    //fillable attributes
    protected $fillable = [];

    //get the roles associated with the module
    public function roles()
    {
        return $this->belongsToMany(Role::class,'role_modules','module_id','role_id')
            ->withPivot(['can_view', 'can_edit', 'can_delete', 'can_create']);

    }
}
