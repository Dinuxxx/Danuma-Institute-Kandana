<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exams extends Model
{
    /** @use HasFactory<\Database\Factories\ExamsFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'exam_id';
    
    protected $fillable = ['exam_name','date'];

    //get the course of the exam
    public function course() :BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    //get the marks  of the exam
    public function marks()
    {
        return $this->hasMany(ExamMarks::class, 'exam_id', 'exam_id');
    }
}
