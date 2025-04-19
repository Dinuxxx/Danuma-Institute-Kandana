<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminNoticeController extends Controller
{
    /**
     * Display a listing of notices.
     */
    public function index(Request $request)
    {
        // Only get notices created by the current admin
        $notices = Notice::where('user_id', auth()->id())->latest()->get();
        
        // Check if it's an explicit API request but NOT an Inertia request
        if (($request->ajax() || $request->wantsJson()) && !$request->header('X-Inertia')) {
            return response()->json($notices);
        }
        
        // For Inertia requests, return Inertia page with notices as props
        return Inertia::render('Admin/Notices', [
            'initialNotices' => $notices
        ]);
    }

    /**
     * Store a newly created notice.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'details' => 'required|string',
            'visibility' => 'required|array',
        ]);
        
        $attachmentPath = null;
        
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('notices', 'public');
        }
        
        $notice = Notice::create([
            'title' => $request->title,
            'details' => $request->details,
            'attachment' => $attachmentPath,
            'visibility' => $request->visibility,
            'user_id' => auth()->id(),
        ]);
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Notice created successfully',
                'notice' => $notice
            ]);
        }
        
        return redirect()->back()->with('success', 'Notice created successfully');
    }
    
    /**
     * Update the specified notice.
     */
    public function update(Request $request, Notice $notice)
    {
        // Check if the authenticated user owns this notice
        if ($notice->user_id !== auth()->id()) {
            if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized action'
                ], 403);
            }
            
            return redirect()->back()->with('error', 'Unauthorized action');
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'details' => 'required|string',
            'visibility' => 'required|array',
        ]);
        
        $data = [
            'title' => $request->title,
            'details' => $request->details,
            'visibility' => $request->visibility,
        ];
        
        // Handle attachment if provided
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($notice->attachment) {
                Storage::disk('public')->delete($notice->attachment);
            }
            
            // Store new attachment
            $file = $request->file('attachment');
            $data['attachment'] = $file->store('notices', 'public');
        }
        
        $notice->update($data);
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Notice updated successfully',
                'notice' => $notice
            ]);
        }
        
        return redirect()->back()->with('success', 'Notice updated successfully');
    }

    /**
     * Delete the specified notice.
     */
    public function destroy(Notice $notice, Request $request)
    {
        // Check if the authenticated user owns this notice
        if ($notice->user_id !== auth()->id()) {
            if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized action'
                ], 403);
            }
            
            return redirect()->back()->with('error', 'Unauthorized action');
        }
        
        try {
            if ($notice->attachment) {
                Storage::disk('public')->delete($notice->attachment);
            }
            
            $notice->delete();
            
            if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notice deleted successfully'
                ]);
            }
            
            return redirect()->back()->with('success', 'Notice deleted successfully');
        } catch (\Exception $e) {
            if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete notice: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Failed to delete notice: ' . $e->getMessage());
        }
    }
}