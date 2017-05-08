<?php

namespace Xcms\Base\Http\Controllers;

class DashboardController extends SystemController
{
    public function index()
    {
        $this->setPageTitle('控制面板');
        return view('base::dashboard');
    }
}
