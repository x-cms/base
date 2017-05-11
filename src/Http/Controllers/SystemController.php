<?php

namespace Xcms\Base\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Xcms\Base\Facades\BreadcrumbsFacade;

class SystemController extends Controller
{
    public $breadcrumbs;

    protected $loggedInUser;

    public function __construct()
    {
        $this->middleware('auth.admin');

        $this->middleware(function (Request $request, $next) {
            $this->breadcrumbs = BreadcrumbsFacade::setBreadcrumbClass('breadcrumb')
                ->setContainerTag('ol')
                ->addLink('后台首页', route('dashboard.index'), '<i class="fa fa-home mr5"></i>');

            $this->loggedInUser = $request->user('admin');
            view()->share([
                'loggedInUser' => $this->loggedInUser
            ]);

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
