<?php

namespace Xcms\Base\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Xcms\Base\Facades\Breadcrumbs;

class SystemController extends Controller
{
    public $breadcrumbs;

    public function __construct()
    {
        $this->middleware(function (Request $request, $next) {
            $this->breadcrumbs = Breadcrumbs::setBreadcrumbClass('breadcrumb')
                ->setContainerTag('ol')
                ->addLink('后台首页', route('dashboard.index'), '<i class="fa fa-home mr5"></i>');
            return $next($request);
        });
    }

    /**
     * Set page title
     * @param $title
     * @param null $subTitle
     */
    public function setPageTitle($title, $subTitle = null)
    {
        view()->share([
            'pageTitle' => $title,
            'subPageTitle' => $subTitle,
        ]);
    }
}