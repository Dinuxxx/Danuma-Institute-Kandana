<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected $fillable = ['grade'];

    // get the parent of the student
    public function parent() :BelongsTo
    {
        return $this->belongsTo(Parent::class, 'parent_id', 'parent_id');
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

}
