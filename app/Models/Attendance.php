<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;
    
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'att_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    // Mass-assignable attributes
    protected $fillable = [
        'check_in_time',
        'check_out_time',
        'date',
        'student_id',
    ];

    // get who marked this attendance
    public function markedBy():BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by','id');
    }

    // get the student of this attendance
    public function student():BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id','student_id');
    }

    //get the courses scheduled for the day
    public function courseAttendances() :HasMany
    {
        return $this->hasMany(CourseAttendance::class, 'att_id', 'att_id');
    }
}
