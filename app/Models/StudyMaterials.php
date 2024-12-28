<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyMaterials extends Model
{
    /** @use HasFactory<\Database\Factories\StudyMaterialsFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'material_id';

    // Mass-assignable attributes
    protected $fillable = [
        'material_title',
        'material_desc'
    ];

    // get the course of this material
    public function course():BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id','course_id');
    }

}
