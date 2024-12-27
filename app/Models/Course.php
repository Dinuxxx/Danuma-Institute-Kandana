<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'course_id';
    
    protected $fillable = ['monthly_fees','course_name','course_desc','subject','grade'];

    //get the teacher of the course
    public function teacher() :BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id', 'tea_id');
    }

    //get the students who registered for this course
    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_courses', 'course_id', 'student_id')
                    ->withPivot('registered_date_time', 'status');
    }
}
