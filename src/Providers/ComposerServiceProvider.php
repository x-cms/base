<?php namespace Xcms\Base\Providers;

use Illuminate\Support\ServiceProvider;
use Xcms\Base\Http\ViewComposers\AdminBreadcrumbsViewComposer;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        view()->composer([
            'base::partials.breadcrumbs',
        ], AdminBreadcrumbsViewComposer::class);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {

    }
}
