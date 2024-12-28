<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseAttendance extends Model
{
    /** @use HasFactory<\Database\Factories\CourseAttendanceFactory> */
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

    // Mass-assignable attributes
    protected $fillable = [ ];

    //get the attendance records
    public function attendance():BelongsTo
    {
        return $this->belongsTo(Attendance::class, 'att_id', 'att_id');
    }

    //get the course time slots assigned for the day
    public function timeSlot()
    {
        return $this->belongsTo(TimeTables::class, 'for_slot', 'ttable_id');
    }

}
