<?php namespace Xcms\Base\Http\ViewComposers;

use Illuminate\View\View;
use Xcms\Base\Facades\Breadcrumbs;

class AdminBreadcrumbsViewComposer
{
    /**
     * @param View $view
     */
    public function compose(View $view)
    {
        $view->with('pageBreadcrumbs', Breadcrumbs::render());
    }
}
