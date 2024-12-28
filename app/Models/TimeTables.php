<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeTables extends Model
{
    /** @use HasFactory<\Database\Factories\TimeTablesFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'ttable_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    // Mass-assignable attributes
    protected $fillable = [
        'day_of_week',
        'start_time',
        'end_time',
        'course_id',
    ];


    //get the course of particular timeslot
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    //get the attendance of a particular slot
    public function courseAttendances()
    {
        return $this->hasMany(CourseAttendance::class, 'for_slot', 'ttable_id');
    }
}
