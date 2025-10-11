-include tpl/Makefile

REPO_RES_DIR := res
REPO_TPL_DIR := tpl
ifeq ($(MKDOCS_ENV),deploy)
    REPO_PREFIX := https://github.com/
else
    REPO_PREFIX := git@github.com:
endif
REPO_RES_URL := $(REPO_PREFIX)ecoslab/website-res.git
REPO_TPL_URL := $(REPO_PREFIX)ecoslab/website-tpl-mkdocs.git

LINK_TARGET := src/zh src/en

setup:
	@echo "Checking and setting up directories..."
	@if [ ! -d "$(REPO_RES_DIR)" ]; then \
		echo "Cloning res repository..."; \
		git clone $(REPO_RES_URL) $(REPO_RES_DIR); \
	else \
		echo "$(REPO_RES_DIR) already exists, updating..."; \
		cd $(REPO_RES_DIR) && git pull; \
	fi

	@if [ ! -d "$(REPO_TPL_DIR)" ]; then \
		echo "Cloning tpl repository..."; \
		git clone $(REPO_TPL_URL) $(REPO_TPL_DIR); \
	else \
		echo "$(REPO_TPL_DIR) already exists, updating..."; \
		cd $(REPO_TPL_DIR) && git pull; \
	fi

	@for target in $(LINK_TARGET); do \
		if [ ! -e "$$target/res" ]; then \
			echo "Creating symlink: $$target/res -> $(REPO_RES_DIR)"; \
			cd $$target && ln -sf ../../res ./ && cd -; \
		else \
			echo "Symlink or file already exists: $$target"; \
		fi; \
	done
	@echo "Setup completed."

.PHONY: setup
