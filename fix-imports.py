import os
import re

base_dir = r'd:\AIPromo-Web\src\test\unit\components\Staff'

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.test.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix component imports
            content = re.sub(r"from '\.\./\.\./\.\./components/Staff/", "from '../../../../../components/Staff/", content)
            
            # Fix component mocks
            content = re.sub(r"jest\.mock\('\.\./\.\./\.\./components/Staff/", "jest.mock('../../../../../components/Staff/", content)
            
            # Fix store mocks
            content = re.sub(r"jest\.mock\('\.\./\.\./\.\./store/", "jest.mock('../../../store/", content)
            
            # Fix utils mocks
            content = re.sub(r"jest\.mock\('\.\./\.\./\.\./utils/", "jest.mock('../../../utils/", content)
            
            # Fix require statements for store
            content = re.sub(r"require\('\.\./\.\./\.\./\.\./store/", "require('../../../store/", content)
            
            # Fix require statements for utils
            content = re.sub(r"require\('\.\./\.\./\.\./\.\./utils/", "require('../../../utils/", content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'Fixed: {filepath}')

print('Done!')
