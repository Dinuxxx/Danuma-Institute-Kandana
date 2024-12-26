<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QRCodes extends Model
{
    /** @use HasFactory<\Database\Factories\QRCodesFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'QR_id';
    
    protected $fillable = [];

    //get the student of the QR
    public function admin() :HasOne
    {
        return $this->hasOne(Student::class, 'QR_id', 'QR_id');
    }
}
