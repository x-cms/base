<?php

namespace Xcms\Base\Http\Controllers;

use App\Http\Controllers\Controller;
use Xcms\Settings\Models\Setting;
use Xcms\Themes\Facades\ThemeFacade as Theme;

class PublicController extends Controller
{
    public function __construct()
    {
        $theme = Setting::where('name', 'theme')->first();
        Theme::setActive($theme->value);
    }

    public function index()
    {
        return Theme::view('templates.index');
    }
}
