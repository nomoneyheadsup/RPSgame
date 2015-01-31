import os
dirname = os.path.join(os.path.dirname( __file__ ), '..', 'game')

print('Serving files from ' + dirname)

STATIC_PATH = dirname
TEMPLATE_PATH = dirname