"""
Built-in checks. Importing this package registers every BaseCheck subclass below.

To add an engine later: drop a new module in this folder that defines a
`class MyCheck(BaseCheck): ...`, then add one import line here (or rely on the
auto-loader in pipeline.py, which imports every *.py in this directory).
"""

from . import secrets          # noqa: F401
from . import dependencies     # noqa: F401
from . import static_analysis  # noqa: F401
from . import headers          # noqa: F401
