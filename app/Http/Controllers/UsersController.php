<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsersController extends Controller
{
    public function index()
    {
        $users = DB::table('user_registrations')
            ->join('users', 'user_registrations.user_id', '=', 'users.id')
            ->leftJoin('roles', 'user_registrations.role_id', '=', 'roles.role_id')
            ->select(
                'user_registrations.registration_id as id',
                'users.name',
                'roles.role_name as role',
                'user_registrations.created_at'
            )
            ->get();

        return response()->json($users);
    }

    public function searchUsers(Request $request)
    {
        $query = DB::table('user_registrations')
            ->join('users', 'user_registrations.user_id', '=', 'users.id')
            ->leftJoin('roles', 'user_registrations.role_id', '=', 'roles.role_id')
            ->select(
                'user_registrations.registration_id as id',
                'users.name',
                'roles.role_name as role',
                'user_registrations.created_at'
            );

        // Apply search filter if provided
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where('users.name', 'like', "%{$searchTerm}%");
        }

        // Apply role filter if provided
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('roles.role_name', $request->role);
        }

        // Apply sorting if provided
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'name':
                    $query->orderBy('users.name');
                    break;
                case 'day':
                    $query->orderBy('user_registrations.created_at', 'desc');
                    break;
                default:
                    $query->orderBy('user_registrations.created_at', 'desc');
            }
        } else {
            $query->orderBy('user_registrations.created_at', 'desc');
        }

        $users = $query->get();
        return response()->json($users);
    }

    public function destroy(Request $request)
    {
        try {
            // For single user deletion
            if ($request->has('id')) {
                $registration = UserRegistration::findOrFail($request->id);
                $userId = $registration->user_id;
                
                // Start transaction to ensure data consistency
                DB::beginTransaction();
                
                // Delete user registration
                $registration->delete();
                
                // Delete user account
                User::where('id', $userId)->delete();
                
                DB::commit();
                
                return response()->json(['message' => 'User deleted successfully'], 200);
            }
            
            // For bulk deletion
            if ($request->has('ids') && is_array($request->ids)) {
                // Start transaction
                DB::beginTransaction();
                
                foreach ($request->ids as $id) {
                    $registration = UserRegistration::find($id);
                    if ($registration) {
                        $userId = $registration->user_id;
                        $registration->delete();
                        User::where('id', $userId)->delete();
                    }
                }
                
                DB::commit();
                
                return response()->json(['message' => 'Users deleted successfully'], 200);
            }
            
            return response()->json(['message' => 'No users specified for deletion'], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting user(s)', 'error' => $e->getMessage()], 500);
        }
    }
}