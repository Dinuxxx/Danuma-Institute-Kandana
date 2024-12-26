<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Parents extends Model
{
    /** @use HasFactory<\Database\Factories\ParentsFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'parent_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    // Attributes not allowed for mass assignment
    protected $guarded = ['parent_id'];

    // Get the student of this parent.
    public function student(): HasOne
    {
        return $this->hasOne(Student::class,'parent_id','parent_id');
    }
}
