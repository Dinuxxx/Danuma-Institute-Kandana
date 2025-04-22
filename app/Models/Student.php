<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'student_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    protected $fillable = [
    'grade',
    'QR_id',
    'parent_id',
    'user_id',
];

    // get the parent of the student
    public function parent() :BelongsTo
    {
        return $this->belongsTo(Parents::class, 'parent_id', 'parent_id');
    }

    // get the QR of the student
    public function qrCode() :BelongsTo
    {
        return $this->belongsTo(QRCodes::class, 'QR_id', 'QR_id');
    }

    // get the user details of student
    public function user() :BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // get the attendances of the student
    public function attendances():HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id','student_id');
    }

    //get the courses that a student registered for
    public function courses():BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'student_courses', 'student_id', 'course_id')
                    ->withPivot('registered_date_time', 'status');
    }

     // get the payments verified by current user
    public function payments(): HasMany
    {
        return $this->hasMany(Payments::class, 'student_id', 'student_id');
    }

    //get the exammarks  of the student
    public function examMarks():HasMany
    {
        return $this->hasMany(ExamMarks::class, 'student_id', 'student_id');
    }
}
