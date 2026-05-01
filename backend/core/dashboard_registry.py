"""
Dashboard Stats Registry — Loose Coupling Pattern.

Feature apps register their own stat-providing callables here,
so that `core.dashboard` never needs to import from child apps directly.

Usage in any app's apps.py ready() method:
    from core.dashboard_registry import register_stat_provider
    register_stat_provider('my_app', my_stats_callable)

The callable receives no arguments and must return a dict of context variables.
"""
import logging
from typing import Callable

logger = logging.getLogger(__name__)

_stat_providers: dict[str, Callable] = {}


def register_stat_provider(name: str, provider: Callable):
    """Register a callable that returns dashboard context dict."""
    _stat_providers[name] = provider
    logger.debug(f"Dashboard registry: registered provider '{name}'")


def collect_all_stats(request=None) -> dict:
    """
    Call all registered providers and merge their context dicts.
    Passes `request` to the provider if possible.
    Each provider is wrapped in try/except so one failing app
    cannot crash the entire dashboard.
    """
    import inspect
    context = {}
    for name, provider in _stat_providers.items():
        try:
            # Check if provider accepts a request argument
            sig = inspect.signature(provider)
            if 'request' in sig.parameters or any(p.kind == inspect.Parameter.VAR_POSITIONAL for p in sig.parameters.values()):
                result = provider(request)
            else:
                result = provider()
                
            if isinstance(result, dict):
                context.update(result)
        except Exception as e:
            logger.warning(f"Dashboard registry: provider '{name}' failed: {e}")
    return context
