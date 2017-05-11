<?php namespace Xcms\Base\Http\ViewComposers;

use Illuminate\View\View;
use Xcms\Base\Facades\BreadcrumbsFacade;

class AdminBreadcrumbsViewComposer
{
    /**
     * @param View $view
     */
    public function compose(View $view)
    {
        $view->with('pageBreadcrumbs', BreadcrumbsFacade::render());
    }
}
