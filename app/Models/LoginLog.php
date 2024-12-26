<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    /** @use HasFactory<\Database\Factories\LoginLogFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'llg_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    // Attributes allowed for mass assignment
    protected $fillable = [];

    // get the user details of current login
    public function user() :BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    
}
