<?php

namespace Xcms\Base\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Xcms\Blog\Models\Category;
use Xcms\Page\Models\Page;
use Xcms\Settings\Models\Setting;
use Xcms\Themes\Facades\ThemeFacade as Theme;
use Xcms\Themes\Facades\ThemeFacade;

class PublicController extends Controller
{
    public function __construct()
    {
        $theme = Setting::where('name', 'theme')->first();
        Theme::setActive($theme->value);
    }

    public function index()
    {
        return Theme::view('templates.page.index');
    }

    public function getView($slug, Request $request)
    {
        $page = Page::where('slug', $slug)->first();

        if (!empty($page)) {
            return Theme::view('templates.page.' . $page->template, compact('page'));
        }else{
            $category = Category::where('slug', $slug)->first();

            if(!empty($category)){

                return Theme::view('templates.category.' . $category->template, compact('category'));
            }
        }
    }
}
