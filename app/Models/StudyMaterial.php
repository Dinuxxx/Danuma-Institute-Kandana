<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyMaterial extends Model
{
    use HasFactory;
    
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'material_id';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'material_title',
        'material_desc',
        'material_path',
        'material_url',
        'material_url_title',
        'is_visible',
        'course_id'
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'course_id' => 'string'
    ];
    
    /**
     * Get the course that this study material belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}