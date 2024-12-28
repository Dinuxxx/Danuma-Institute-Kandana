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

    //get the timetables  for the course
    public function timeTables()
    {
        return $this->hasMany(TimeTables::class, 'course_id', 'course_id');
    }

    //get the studymaterials  for the course
    public function studyMaterials()
    {
        return $this->hasMany(StudyMaterials::class, 'course_id', 'course_id');
    }

    //get the payments  for the course
    public function paymentCourses()
    {
        return $this->hasMany(PaymentCourse::class, 'course_id', 'course_id');
    }

    //get the exams  of the course
    public function exams()
    {
        return $this->hasMany(Exams::class, 'course_id', 'course_id');
    }

}
