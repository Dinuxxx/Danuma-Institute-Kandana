<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamMarks extends Model
{
    /** @use HasFactory<\Database\Factories\ExamMarksFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'row_id';

     /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
    protected $fillable = ['marks','exam_id','student_id'];

    //get the exam of the marks
    public function exam() :BelongsTo
    {
        return $this->belongsTo(Exams::class, 'exam_id', 'exam_id');
    }

    //get the student of the marks
    public function student() :BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
